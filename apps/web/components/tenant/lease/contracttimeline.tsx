export const ContractTimeline = ({ lease }: { lease: any }) => {
    const events = [
        { label: "Start Date", date: new Date(lease.startDate).toLocaleDateString(), status: "past" },
        { label: "Current Status", date: lease.status, status: "active" },
        { label: "End Date", date: new Date(lease.endDate).toLocaleDateString(), status: "future" },
    ];

    return (
        <div className="bg-primary-950 text-white rounded-xl p-8 w-full md:w-80 shadow-lg">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">
                Contract Timeline
            </p>

            <div className="space-y-10 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-700" />

                {events.map((event, idx) => (
                    <div key={idx} className="relative pl-8 flex flex-col gap-1">
                        <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 bg-primary-950 z-10 flex items-center justify-center
              ${event.status === 'past' ? 'border-secondary-500 bg-secondary-500' :
                                event.status === 'active' ? 'border-secondary-500' : 'border-slate-600'}`}
                        >
                            {event.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-secondary-500" />}
                        </div>

                        <p className={`text-[11px] font-bold ${event.status === 'active' ? 'text-secondary-500' : 'text-slate-400'}`}>
                            {event.label}
                        </p>
                        <p className="text-lg font-bold text-white">{event.date}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};