import { fail, redirect } from "@sveltejs/kit";
import { superValidate, message, type SuperValidated, type Infer } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { loginSchema, type LoginSchema } from "$lib/schemas/auth";

export const load = async () => {
  const form = await superValidate(zod(loginSchema as any)) as SuperValidated<LoginSchema>;
  return { form };
};

export const actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod(loginSchema as any)) as SuperValidated<LoginSchema>;

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await locals.pb.collection("users").authWithPassword(
        form.data.email,
        form.data.password
      );
    } catch (err: any) {
      console.error("Login error:", err);
      return message(form, err.message || "Invalid email or password", {
        status: 400
      });
    }

    throw redirect(303, "/");
  },
};
