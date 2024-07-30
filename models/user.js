const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createUserToken } = require("../services/auth");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    salt: {
      type: String,
    },

    dp: {
      type: String,
      default: "/images/default.png",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this; //pointing curr user

  if (!user.isModified("password")) return;

  //for new users/admins
  const salt = randomBytes(20).toString();
  const hashed = createHmac("sha256", salt)
                .update(user.password)
                .digest("hex");

  this.salt = salt;
  this.password = hashed;

  next();
});

userSchema.static("matchPasswordAndCreateToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("user not found");

  const salt = user.salt;
  const hashed = user.password;

  const userProvidedPassword = createHmac("sha256", salt)
                              .update(password)
                              .digest("hex");

  if (hashed !== userProvidedPassword) throw new Error("Incorrect password");

  // return { ...user, password: undefined, hashed: undefined };
  // return user;

  const token = createUserToken(user);
  return token;
});

module.exports = model("user", userSchema);
