import { NotFoundError, SecurePassword, resolver } from "blitz";

import { ChangePassword } from "../validations";

import { authenticateUser } from "./login";

import db from "db";

export default resolver.pipe(
  resolver.zod(ChangePassword),
  resolver.authorize(),
  async ({ currentPassword, newPassword }, ctx) => {
    const user = await db.user.findFirst({
      where: { id: ctx.session.userId! },
    });
    if (!user) throw new NotFoundError();

    await authenticateUser(user.email, currentPassword);

    const hashedPassword = await SecurePassword.hash(newPassword.trim());
    await db.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    });

    return true;
  }
);
