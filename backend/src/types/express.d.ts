declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        username: string
        subscriptionStatus: string
      }
    }
  }
}

export {}
