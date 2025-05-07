export default function Dashboard() {
    return (
      <div className="p-6 w-full dark:text-white">
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-2xl font-semibold mb-1">🔥 Keep it up!</h2>
          <p className="text-sm">You're on a roll! Stay consistent to protect your eyes and maintain your streak.</p>
          <div className="mt-4 flex gap-3">
            {[7, 14, 30].map((day) => (
              <span key={day} className="bg-white/20 px-3 py-1 rounded text-sm">{day} Days</span>
            ))}
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Reminders" button="Set Reminder" />
          <Card title="Eye Exercises" button="Start Exercise" />
          <Card title="Analytics" button="View Analytics" />
        </div>
      </div>
    );
  }
  
  function Card({ title, button }: { title: string; button: string }) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded shadow text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">
          {title === "Reminders"
            ? "Set break reminders to rest your eyes."
            : title === "Eye Exercises"
            ? "Guided exercises to reduce strain."
            : "Track your usage over time."}
        </p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm">
          {button}
        </button>
      </div>
    );
  }
  