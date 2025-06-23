"use client";

import { useEffect, useState } from "react";
import { env } from "@/lib/config";

type BagDataPoint = {
	timestamp: string;
	count: number;
	bagType: string;
};

export default function Home() {
	const [bagType, setBagType] = useState("800g");
	const [dados, setDados] = useState<BagDataPoint[]>([]);

	useEffect(() => {
		async function fetchDados() {
			try {
				const res = await fetch(
					`${env.NEXT_PUBLIC_API_URL}/dados?period=1d&bagType=${bagType}`,
				);
				const json = await res.json();
				setDados(json);
			} catch (err) {
				console.error("Erro ao buscar dados iniciais:", err);
			}
		}

		fetchDados();
	}, [bagType]);

	return (
		<div>
			<h1>Gráfico de Sacos</h1>

			<label>Tipo:</label>
			<select value={bagType} onChange={(e) => setBagType(e.target.value)}>
				<option value="800g">800g</option>
				<option value="1kg">1kg</option>
				<option value="2kg">2kg</option>
			</select>

			<pre>{JSON.stringify(dados, null, 2)}</pre>
		</div>
	);
}
