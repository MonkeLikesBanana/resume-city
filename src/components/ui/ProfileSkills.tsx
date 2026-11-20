import { PROFILE_SKILLS } from '../../content/profile'

export default function ProfileSkills() {
  return (
    <div className="mt-4 text-sm">
      <p className="font-semibold">Skills</p>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[var(--color-ink)]/85">
        {PROFILE_SKILLS.map((skill) => <li key={skill}>{skill}</li>)}
      </ul>
    </div>
  )
}
