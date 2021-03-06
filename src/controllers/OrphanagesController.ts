import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import Orphanage from '../models/Orphanage'
import Image from '../models/Images'
import orphanageView from '../views/orphanages_view';
import * as Yup from 'yup'

export default {
    async index(request: Request, response: Response) {
        const orphanagesRepository = getRepository(Orphanage);

        const orphanages = await orphanagesRepository.find({
            relations: ['images']
        });

        return response.json(orphanageView.renderMany(orphanages))
    },

    async show(request: Request, response: Response) {
        const { id } = request.params

        const orphanagesRepository = getRepository(Orphanage);

        const orphanage = await orphanagesRepository.findOneOrFail(id, {
            relations: ['images']
        });

        return response.json(orphanageView.render(orphanage));
    },

    async create(request: Request, response: Response) {
        const {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends,
            pending,
        } = request.body

        const orphanagesRepository = getRepository(Orphanage)

        const requestImages = request.files as Express.Multer.File[];
        const images = requestImages.map(image => {
            return { path: image.filename }
        })

        const data = {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends: open_on_weekends === 'true',
            pending: pending === 'true',
            images
        }

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            latitude: Yup.number().required(),
            longitude: Yup.number().required(),
            about: Yup.string().required().max(300),
            instructions: Yup.string().required(),
            opening_hours: Yup.string().required(),
            open_on_weekends: Yup.boolean().required(),
            pending: Yup.boolean().required(),
            images: Yup.array(
                Yup.object().shape({
                    path: Yup.string().required()
                })
            )
        });

        await schema.validate(data, {
            abortEarly: false,
        })

        const orphanage = orphanagesRepository.create(data)

        await orphanagesRepository.save(orphanage);

        return response.status(201).json(orphanage)
    },

    async update(request: Request, response: Response) {
        const {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends,
            pending,
        } = request.body
        const { id } = request.params

        const data = {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends: open_on_weekends === 'true',
            pending: pending === 'true'
        }

        const orphanagesRepository = getRepository(Orphanage)

        const orphanage = await orphanagesRepository.findOneOrFail(id, {
            relations: ['images']
        });

        data.name = orphanage.name !== data.name ? data.name : orphanage.name;
        data.latitude = orphanage.latitude !== data.latitude ? data.latitude : orphanage.latitude;
        data.longitude = orphanage.longitude !== data.longitude ? data.longitude : orphanage.longitude;
        data.about = orphanage.about !== data.about ? data.about : orphanage.about;
        data.instructions = orphanage.instructions !== data.instructions ? data.instructions : orphanage.instructions;
        data.open_on_weekends = orphanage.open_on_weekends !== data.open_on_weekends ? data.open_on_weekends : orphanage.open_on_weekends;
        data.opening_hours = orphanage.opening_hours !== data.opening_hours ? data.opening_hours : orphanage.opening_hours;
        data.pending = orphanage.pending !== data.pending ? data.pending : orphanage.pending;

        const requestImages = request.files as Express.Multer.File[];
        if (requestImages.length !== 0) {
            const images = requestImages.map(image => {
                return { path: image.filename }
            })
            const data2 = {
                name: data.name,
                latitude: data.latitude,
                longitude: data.longitude,
                about: data.about,
                instructions: data.instructions,
                opening_hours: data.opening_hours,
                open_on_weekends: data.open_on_weekends,
                pending: data.pending,
            }

            await orphanagesRepository.update({ id: orphanage.id }, data2);

            const imageRepository = getRepository(Image)
            const imagesSaves = images.map( (image) => {
                const imageSave = imageRepository.create(image);
                imageSave.orphanage = orphanage
                return imageSave
            })

            imageRepository.delete({ orphanage })
            imagesSaves.map( async image => {
                await imageRepository.save(image)
            })

        } else {
            await orphanagesRepository.update({ id: orphanage.id }, data);
        }

        return response.status(200).json(orphanage);
    },

    async delete(request: Request, response: Response) {
        const { id } = request.params

        const orphanagesRepository = getRepository(Orphanage);

        await orphanagesRepository.delete( id )

        response.send()
    }
}