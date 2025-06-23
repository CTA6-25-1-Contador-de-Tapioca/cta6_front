import { z } from "zod";

const envSchema = z.object({
	NEXT_PUBLIC_API_URL: z.string().url(),
});

console.log(process.env.NEXT_PUBLIC_API_URL);
const _env = envSchema.safeParse(process.env);

console.log(!_env.success);
if (!_env.success) {
	console.error(
		"❌ Erro ao validar variáveis de ambiente:",
		_env.error.format(),
	);
	console.error(_env.error.issues);
	process.exit(1);
}

export const env = _env.data;
