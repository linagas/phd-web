import { safeDecodeParam } from "@/utils/quality-pulse/admin-view-models";
import PublishReviewView from "../../../components/publish-review-view";

interface RevisarPageProps {
  params: { clientKey: string };
}

/**
 * `/administracion/clientes/{clientKey}/revisar` (spec `qp-admin-publish-review`).
 * Página delgada dentro del route group `(console)` para heredar el guard de
 * sesión de `(console)/layout.tsx` (D7, defensa en profundidad). El `clientKey`
 * llega vía `safeDecodeParam` porque Next 14.2 puede entregarlo ya decodificado
 * o todavía codificado según cómo se haya generado el link.
 */
export default function RevisarPage({ params }: RevisarPageProps) {
  const clientKey = safeDecodeParam(params.clientKey);

  return <PublishReviewView clientKey={clientKey} />;
}
