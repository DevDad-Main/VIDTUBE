//NOTE: Express Route ⟶ asyncHandler wrapper
//                ⟶ Executes your async function
//                   ⟶ If success: continue
//                   ⟶ If error: caught and passed to next(err)

const asyncHandler = (requestHandler) => {
  //NOTE: Wrapping it all up and sending it back
  //NOTE: Next handles all of the in between
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
