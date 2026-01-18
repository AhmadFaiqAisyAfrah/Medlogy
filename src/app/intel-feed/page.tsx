import { IntelFeedView } from "./IntelFeedView";
import { getActiveOutbreak, getNewsSignals } from "@/lib/data";

export const dynamic = 'force-dynamic';

export default async function IntelFeedPage() {
    const outbreak = await getActiveOutbreak();

    if (!outbreak) {
        return (
            <div className="p-8 text-center text-slate-400">
                No active outbreak found.
            </div>
        );
    }

    const news = await getNewsSignals(outbreak.id);

    return <IntelFeedView outbreak={outbreak} news={news} />;
}
