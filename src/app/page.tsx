"use client";

import { useEffect, useState } from "react";
import { MyChart } from "@/components/MyChart";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { io, Socket } from "socket.io-client";

type BagDataPoint = {
	timestamp: string;
	count: number;
	bagType: string;
};
let socket: Socket;

function roundDateToWindow(date: Date, period: string): Date {
	const d = new Date(date); // cópia

	if (period === "1d") {
		d.setSeconds(0, 0); // agrupa por minuto
	} else if (period === "7d" || period === "30d") {
		d.setUTCHours(0, 0, 0, 0); // agrupa por dia
	}
	return d;
}

export default function Home() {
	const [bagType, setBagType] = useState("800g");
	const [period, setPeriod] = useState("1d");
	const [dados, setDados] = useState<BagDataPoint[]>([]);

	useEffect(() => {
		// Conecta ao socket.io no servidor
		socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
			transports: ["websocket"],
		});

		socket.on("connect", () => {
			console.log("🟢 Socket conectado:", socket.id);

			// Assina o tipo atual
			socket.emit("subscribe", { bagType });
		});

		// Recebe dados em tempo real
		socket.on("novo-dado", (novoDado: any) => {
			const rawDate = new Date(novoDado.timestamp);
			const roundedDate = roundDateToWindow(rawDate, period).toISOString();

			setDados((prev) => {
				const lastIndex = prev.length - 1;
				const lastItem = prev[lastIndex];

				// ✅ Mesma janela da última agregação da API
				if (
					lastItem &&
					lastItem.timestamp === roundedDate &&
					lastItem.bagType === novoDado.bagType
				) {
					const atualizado = [...prev];
					atualizado[lastIndex] = {
						...lastItem,
						count: lastItem.count + 1,
					};
					return atualizado;
				}

				// ✅ Se já existe outro item na mesma janela
				const idx = prev.findIndex(
					(d) => d.timestamp === roundedDate && d.bagType === novoDado.bagType,
				);
				if (idx !== -1) {
					const atualizado = [...prev];
					atualizado[idx] = {
						...prev[idx],
						count: prev[idx].count + 1,
					};
					return atualizado;
				}

				// ❌ Nova janela, adicionar novo
				return [
					...prev,
					{
						timestamp: roundedDate,
						count: 1,
						bagType: novoDado.bagType,
					},
				];
			});
		});

		return () => {
			socket.disconnect();
		};
	}, [bagType]);
	useEffect(() => {
		async function fetchDados() {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/dados?period=${period}&bagType=${bagType}`,
				);
				const json: BagDataPoint[] = await res.json();
				setDados(json);

				// 🟢 define o timestamp da última entrada da API
				if (json.length > 0) {
					setLastApiTimestamp(json[json.length - 1].timestamp);
				}
			} catch (err) {
				console.error("Erro ao buscar dados iniciais:", err);
			}
		}
		fetchDados();
	}, [bagType, period]);

	return (
		<div className="space-y-6 p-6">
			<div className="space-y-2">
				<Label>Tipo de Saco</Label>
				<Select value={bagType} onValueChange={setBagType}>
					<SelectTrigger className="w-[200px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="800g">800g</SelectItem>
						<SelectItem value="1kg">1kg</SelectItem>
						<SelectItem value="2kg">2kg</SelectItem>
					</SelectContent>
				</Select>

				<Label>Periodo</Label>
				<Select value={period} onValueChange={setPeriod}>
					<SelectTrigger className="w-[200px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="1d">1 dia</SelectItem>
						<SelectItem value="30d">30 dias</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<MyChart data={dados} />
		</div>
	);
}
