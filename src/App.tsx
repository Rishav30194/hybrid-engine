import { useRef } from 'react'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { RestTimer } from './components/RestTimer'
import { ThisWeek } from './screens/ThisWeek'
import { WeekPlan } from './screens/WeekPlan'
import { Template } from './screens/Template'
import { useAppDispatch, useAppState } from './state/context'

/** App shell: header, tab-switched screen, floating rest timer, bottom nav. */
export default function App() {
  const { tab, pillHidden } = useAppState()
  const dispatch = useAppDispatch()
  const scrollTimer = useRef<number | undefined>(undefined)

  // Hide the pill while scrolling; bring it back ~600ms after scrolling stops.
  const onMainScroll = () => {
    if (!pillHidden) dispatch({ type: 'setPillHidden', hidden: true })
    if (scrollTimer.current) clearTimeout(scrollTimer.current)
    scrollTimer.current = window.setTimeout(
      () => dispatch({ type: 'setPillHidden', hidden: false }),
      600,
    )
  }

  return (
    <div className="app">
      <Header />

      <main className="app__main" onScroll={onMainScroll}>
        {tab === 'week' && <ThisWeek />}
        {tab === 'plan' && <WeekPlan />}
        {tab === 'template' && <Template />}
      </main>

      <RestTimer />
      <BottomNav />
    </div>
  )
}
