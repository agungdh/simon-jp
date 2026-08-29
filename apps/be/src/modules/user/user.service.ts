import { userRepository } from "./user.repository";

export const userService = {
  list() {
    return userRepository.findAll();
  },

  getMe(uuid: string) {
    return userRepository.findByUuid(uuid);
  },
};
