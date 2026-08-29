import { userRepository } from "../user/user.repository";

export const authRepository = {
  findByNip(nip: string) {
    return userRepository.findByNip(nip);
  },
};
