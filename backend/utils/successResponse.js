 function successResponse(res, message, data, statusCode = 200) {
  return res.status(statusCode).json({
    status: "Success",
    message,
    data,
  });
}

export default successResponse;
