import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { ThisWeek } from './screens/ThisWeek'
import { WeekPlan } from './screens/WeekPlan'
import { Template } from './screens/Template'
import { useAppState } from './state/context'

/** App shell: header, tab-switched screen, bottom nav. */
export default function App() {
  const { tab } = useAppState()

  return (
    <div className="app">
      <Header />

      <main className="app__main">
        {tab === 'week' && <ThisWeek />}
        {tab === 'plan' && <WeekPlan />}
        {tab === 'template' && <Template />}
      </main>

      <BottomNav />
    </div>
  )
}
