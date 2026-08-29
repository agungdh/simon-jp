import { HttpError } from "../../plugins/error";
import { createSession, deleteSession } from "../../lib/token";
import { authRepository } from "./auth.repository";

export const authService = {
  async login(nip: string, password: string) {
    const [user] = await authRepository.findByNip(nip);

    if (!user || !(await Bun.password.verify(password, user.password))) {
      throw new HttpError(401, "Invalid nip or password");
    }

    const token = await createSession({
      uuid: user.uuid,
    });

    return {
      token,
      user: {
        uuid: user.uuid,
        nip: user.nip,
        nama: user.nama,
        tipe: user.tipe,
      },
    };
  },

  async logout(token: string | null) {
    if (token) await deleteSession(token);
  },
};
