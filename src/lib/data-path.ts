import fs from "fs";
import path from "path";

const CANDIDATE_DIRS = [
  path.join(process.cwd(), "data"),
  path.join(process.cwd(), "src", "app", "pretty_fly_data_pack", "data"),
];

export function getDataDir(): string {
  for (const dir of CANDIDATE_DIRS) {
    if (fs.existsSync(path.join(dir, "variants.csv"))) {
      return dir;
    }
  }
  throw new Error(
    `Pretty Fly CSV data not found. Add CSVs to /data or src/app/pretty_fly_data_pack/data`
  );
}
