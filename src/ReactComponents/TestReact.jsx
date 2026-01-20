import "./styles.scss";
import { useEffect, useState } from "react";

export default function WorksTable() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWorks() {
      try {
        const res = await fetch("/api/works");
        if (!res.ok) {
          throw new Error(`Errore API: ${res.status}`);
        }
        const data = await res.json();
        setWorks(data);
      } catch (err) {
        console.error(err);
        setError("Errore nel caricamento dei lavori");
      } finally {
        setLoading(false);
      }
    }

    fetchWorks();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-600">Caricamento lavori...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!works.length) {
    return <p className="text-sm text-gray-600">Nessun lavoro trovato.</p>;
  }

  return (
    <div className="m-4 border rounded-lg overflow-hidden text-xs">
      

      {/* RIGHE */}
      {works.map((w) => (
         
        <figure key={w.id} className="border-b last:border-0 p-2 hover:bg-gray-50">
          <ul className="grid_layout">
            <li className="avviso">
            <div>Avviso:</div>
            <div>{w.avviso}</div>
            </li>
            <li className="odc">
            <div>ODC:</div>
            <div>{w.odc}</div>
            </li>
            <li className="pdl">
              <div>PDL:</div>
              <div>{w.pdl}</div>
            </li>
            <li className="ditta">
              <div>Ditta:</div>
              <div>{w.ditta}</div>
            </li>
            <li className="referente">
              <div>Referente:</div>
              <div>{w.referente}</div>
            </li>
            <li className="attivita">
              <div>Attività:</div>
              <div>{w.attivita}</div>
            </li>
            <li className="note">
              <div>Note:</div>
              <div>{w.note}</div>
            </li>
            <li className="area">
              <div>Area:</div>
              <div>{w.area}</div>
            </li>
            <li className="impianto">
              <div>Impianto:</div>
              <div>{w.impianto}</div>
            </li>
            <li className="item">
              <div>Item:</div>
              <div>{w.item}</div>
            </li>
            <li className="iniz">
              <div>Inizio:</div>
              <div>{w.iniz}</div>
            </li>
            <li className="fine">
              <div>Fine:</div>
              <div>{w.fine}</div>
            </li>
          </ul>
        </figure>
      ))}
    </div>
  );
}
