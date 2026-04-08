import { pb } from "$lib/pb";
import { userStore, type User } from "$lib/stores/user.svelte";

// The authClient wrapper maintains the same interface as before but uses PocketBase
function createAuthClient() {
  const client = async () => {
    try {
      if (pb.authStore.isValid && pb.authStore.model) {
        const user = pb.authStore.model;
        userStore.user = {
          id: user.id,
          email: user.email,
          name: user.name || user.username || "User",
          avatar: user.avatar ? pb.getFileUrl(user, user.avatar) : undefined
        };
        return { data: { user: userStore.user }, error: null };
      }
      return { data: null, error: new Error("Unauthorized") };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  };

  client.signIn = {
    social: async (options: { provider: string; callbackURL?: string }) => {
        try {
            const authData = await pb.collection('users').authWithOAuth2({ provider: options.provider });
            if (authData.record) {
                userStore.user = {
                    id: authData.record.id,
                    email: authData.record.email,
                    name: authData.record.name || authData.record.username || "User",
                    avatar: authData.record.avatar ? pb.getFileUrl(authData.record, authData.record.avatar) : undefined
                };
                return { data: { user: userStore.user, token: pb.authStore.token }, error: null };
            }
            return { error: { message: "Social login failed" }, data: null };
        } catch (e) {
            return { error: e as Error, data: null };
        }
    },
    google: async (idToken: string) => {
        // PocketBase handles Google via OAuth2 flow, usually not just an idToken from client-side
        // But if we have an idToken, we might need a custom handler.
        // For now, let's assume standard OAuth2 flow is preferred or this is a placeholder.
        console.warn("PocketBase standard OAuth2 recommended over idToken passing");
        return { error: { message: "Google idToken flow not standard for PocketBase SDK" }, data: null };
    },
    email: async (options: { email: string; password: string; callbackURL?: string }) => {
      try {
        const authData = await pb.collection('users').authWithPassword(options.email, options.password);
        
        const userData: User = {
          id: authData.record.id,
          email: authData.record.email,
          name: authData.record.name || authData.record.username || "User",
          avatar: authData.record.avatar ? pb.getFileUrl(authData.record, authData.record.avatar) : undefined
        };
        userStore.user = userData;

        return { data: { user: userData, token: pb.authStore.token }, error: null };
      } catch (e) {
        return { error: e as Error, data: null };
      }
    },
  };

  client.signUp = {
    email: async (options: { email: string; password: string; name?: string; full_name?: string; callbackURL?: string }) => {
      try {
        const data = {
            "username": options.email.split('@')[0] + Math.random().toString(36).substring(7),
            "email": options.email,
            "emailVisibility": true,
            "password": options.password,
            "passwordConfirm": options.password,
            "name": options.name || options.full_name || "",
        };

        const record = await pb.collection('users').create(data);
        
        // After signup, sign in
        return await client.signIn.email({ email: options.email, password: options.password });
      } catch (e) {
        return { error: e as Error, data: null };
      }
    },
  };

  client.signOut = async () => {
    pb.authStore.clear();
    userStore.logout();
    return { error: null };
  };

  client.forgetPassword = async (options: { email: string }) => {
    try {
      await pb.collection('users').requestPasswordReset(options.email);
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  client.resetPassword = async (options: { token: string; new_password: string }) => {
    try {
      // PocketBase reset usually happens via a link which handles the token
      // This is a direct SDK call if you have the token.
      await pb.collection('users').confirmPasswordReset(options.token, options.new_password, options.new_password);
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  return client;
}

export const authClient = createAuthClient();

