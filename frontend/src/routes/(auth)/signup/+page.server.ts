import { fail, redirect } from "@sveltejs/kit";
import { superValidate, message, type SuperValidated } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { signupSchema, type SignupSchema } from "$lib/schemas/auth";

export const load = async () => {
  const form = await superValidate(zod(signupSchema as any)) as SuperValidated<SignupSchema>;
  return { form };
};

export const actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod(signupSchema as any)) as SuperValidated<SignupSchema>;

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const data = {
        username: form.data.email.split('@')[0] + Math.random().toString(36).substring(7),
        email: form.data.email,
        emailVisibility: true,
        password: form.data.password,
        passwordConfirm: form.data.passwordConfirm,
        name: form.data.name,
      };

      await locals.pb.collection("users").create(data);
      await locals.pb.collection("users").authWithPassword(form.data.email, form.data.password);
    } catch (err: any) {
      console.error("Signup error:", err);
      return message(form, err.message || "Failed to create account", {
        status: 400
      });
    }

    throw redirect(303, "/");
  },
};
