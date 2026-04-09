import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  if (locals.user) throw redirect(303, "/");
  return {};
};

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const email = data.get("email") as string;
    const name = data.get("name") as string;
    const password = data.get("password") as string;
    const passwordConfirm = data.get("passwordConfirm") as string;

    if (!email || !password || !name) {
      return fail(400, { error: "Please fill in all fields" });
    }

    if (password !== passwordConfirm) {
      return fail(400, { error: "Passwords do not match" });
    }

    try {
      const userData = {
        username: email.split('@')[0] + Math.random().toString(36).substring(7),
        email: email,
        emailVisibility: true,
        password: password,
        passwordConfirm: passwordConfirm,
        name: name,
      };

      await locals.pb.collection("users").create(userData);
      await locals.pb.collection("users").authWithPassword(email, password);
    } catch (err: any) {
      console.error("Signup error:", err);
      return fail(400, { error: err.message || "Failed to create account" });
    }

    throw redirect(303, "/");
  },
};
