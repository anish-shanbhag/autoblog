import { SecurePassword } from "@blitzjs/auth";
import { Ctx } from "@blitzjs/next";

import db from "db";
import { Role } from "types";

export default async function signup(
  input: { email?: string; password?: string },
  ctx: Ctx
) {
  const blitzContext = ctx;

  const hashedPassword = await SecurePassword.hash(
    input.password || "test-password"
  );
  const email = input.email || "test" + Math.random() + "@test.com";
  const user = await db.user.create({
    data: { email, hashedPassword, role: "user" },
    select: { id: true, name: true, email: true, role: true },
  });

  await blitzContext.session.$create({
    userId: user.id,
    role: user.role as Role,
  });

  return { userId: blitzContext.session.userId, ...user, email: input.email };
}
