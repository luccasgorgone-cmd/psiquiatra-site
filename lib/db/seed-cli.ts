import { seed } from "./seed";

// Semeia sempre (npm run db:seed)
seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
