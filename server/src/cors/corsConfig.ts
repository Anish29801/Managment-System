const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH","DELETE"],
  credentials: true,
};

export default corsOptions;
