import User from "../models/userModel.js";

export async function getUser(req, res, next) {
  const id = req.params.id;

  const user = await User.findById(id);

  return res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
}

export async function getMe(req, res, next) {
  return res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
}
