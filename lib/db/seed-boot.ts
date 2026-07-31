import { seed } from "./seed";

// Executado no start do Railway: só popula se o banco estiver vazio.
// Nunca derruba o start — erros são apenas logados.
seed({ onlyIfEmpty: true })
  .then((r) => {
    if (r?.seeded) console.log("Auto-seed aplicado.");
    process.exit(0);
  })
  .catch((e) => {
    console.error("[seed-boot] ignorado:", (e as Error).message);
    process.exit(0);
  });
