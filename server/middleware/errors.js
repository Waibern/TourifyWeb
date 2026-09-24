export const notFound = (req, res) =>
  res.status(404).json({ message: "Route not found" });
export const errors = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
};
