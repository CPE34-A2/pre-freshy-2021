import nextConnect from 'next-connect'
import middleware from '@/middlewares/middleware'

import Clan from '@/models/clan'
import User from '@/models/user'

const handler = nextConnect()

handler.use(middleware)

/**
 * @method GET
 * @endpoint /api/clans/:id/members
 * @description Get the data of clan's members
 * 
 * @require User authentication
 */
handler.get(async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Please login in' })
  }

  const clanId = req.query.id
  let members = null

  if (!isNaN(clanId)) {
    const clan = await Clan
      .findById(clanId)
      .select('members')
      .lean()
      .exec()
      
    if (clan) {
      members = await User
        .find({ '_id': { $in: clan.members } })
        .select('-password')
        .lean()
        .exec()
    }
  }

  res
    .status(200)
    .json({
      sucesss: !!members,
      data: members,
      timestamp: new Date()
    })
})

export default handler