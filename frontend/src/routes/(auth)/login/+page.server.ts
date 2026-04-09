import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  if (locals.user) throw redirect(303, "/");
  return {};
};

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    if (!email || !password) {
      return fail(400, { error: "Please fill in all fields" });
    }

    try {
      await locals.pb.collection("users").authWithPassword(email, password);
    } catch (err: any) {
      console.error("Login error:", err);
      return fail(400, { error: err.message || "Invalid email or password" });
    }

    throw redirect(303, "/");
  },
};
