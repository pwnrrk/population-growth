import { read, utils } from "xlsx";
import type Population from "../interfaces/population";

export async function getPopulations() {
  const buffer = await (await fetch("/data.csv")).arrayBuffer();
  const workbook = read(buffer);
  return utils.sheet_to_json<Population>(workbook.Sheets[workbook.SheetNames[0]]);
}
