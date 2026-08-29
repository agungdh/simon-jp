import { HttpError } from "../../plugins/error";
import { materiPpmRepository } from "./materi-ppm.repository";
import type {
  MateriPpmCreate,
  MateriPpmUpdate,
} from "./materi-ppm.dto";

export const materiPpmService = {
  list() {
    return materiPpmRepository.list();
  },

  async get(uuid: string) {
    const row = await materiPpmRepository.getByUuid(uuid);
    if (!row) throw new HttpError(404, "Not found");
    return row;
  },

  async create(values: MateriPpmCreate) {
    const { uuid } = await materiPpmRepository.create(values);
    return this.get(uuid);
  },

  async update(uuid: string, values: MateriPpmUpdate) {
    await this.get(uuid);
    return materiPpmRepository.update(uuid, values);
  },

  async remove(uuid: string) {
    await this.get(uuid);
    return materiPpmRepository.remove(uuid);
  },
};
