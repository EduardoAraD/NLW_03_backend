import User from '../models/Users'

export default {
    render(user: User, token: String) {
        return {
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }
    }
}