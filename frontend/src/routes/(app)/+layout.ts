import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }: any) => {
    const { user } = await parent();
    if (!user) {
        throw redirect(303, '/login');
    }
    return { user };
};
