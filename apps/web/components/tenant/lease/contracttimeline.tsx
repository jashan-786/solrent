export const ContractTimeline = () => {
    const events = [
        { label: "Start Date", date: "Oct 01, 2023", status: "past" },
        { label: "Current Cycle", date: "Mar 2024", status: "active" },
        { label: "End Date", date: "Oct 31, 2024", status: "future" },
    ];

    return (
        <div className="bg-brand-navy text-white rounded-twelve p-8 w-full md:w-80 shadow-lg rounded-[12px] bg-[#131B2E]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">
                Contract Timeline
            </p>

            <div className="space-y-10 relative">

                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-700" />

                {events.map((event, idx) => (
                    <div key={idx} className="relative pl-8 flex flex-col gap-1">
                        <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 bg-brand-navy z-10 flex items-center justify-center
              ${event.status === 'past' ? 'border-solrent-emerald bg-solrent-emerald' :
                                event.status === 'active' ? 'border-solrent-emerald' : 'border-slate-600'}`}
                        >
                            {event.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-solrent-emerald" />}
                            {event.status === 'past' && <div className="w-1.5 h-1.5 rounded-full bg-white/50" />}
                        </div>

                        <p className={`text-[11px] font-bold ${event.status === 'active' ? 'text-solrent-emerald' : 'text-slate-400'}`}>
                            {event.label}
                        </p>
                        <p className="text-lg font-bold text-white">{event.date}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};