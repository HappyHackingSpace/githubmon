'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ActivityChartProps {
  commitData?: Record<string, number>
}

export function ActivityChart({ commitData = {} }: ActivityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)

  useEffect(() => {
    if (!chartRef.current || Object.keys(commitData).length === 0) return

    const loadChart = async () => {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)

      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current!.getContext('2d')!
      const dates = Object.keys(commitData).sort()
      const counts = dates.map(date => commitData[date])

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dates.map(date => {
            const d = new Date(date)
            return `${d.getDate()}/${d.getMonth() + 1}`
          }),
          datasets: [{
            label: 'Commit Sayısı',
            data: counts,
            backgroundColor: '#818cf8',
            borderColor: '#6366f1',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      })
    }

    loadChart()

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [commitData])

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Commit Aktivitesi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
}