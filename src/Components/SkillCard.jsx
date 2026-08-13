function SkillCard({ title, skills, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold mb-4">
        {title}
      </h2>

      <div className="flex flex-wrap gap-3">

        {skills.map((skill, index) => (
          <span
            key={index}
            className={`${color} text-white px-4 py-2 rounded-full`}
          >
            {skill}
          </span>
        ))}

      </div>

    </div>
  );
}

export default SkillCard;