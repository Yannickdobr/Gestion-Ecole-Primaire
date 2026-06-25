export const mockDashboardData = {
  kpis: {
    students: { value: 6504, label: "Number of application", type: "gradient" },
    conversion: { value: "45.87 %", label: "Application conversion", trend: "up", change: "1.5%" },
    visits: { value: "245.70k", label: "Pages per visit", trend: "down", change: "2.5%" },
    time: { value: "00:06:30", label: "Average profile view", trend: "down", change: "1.2%" },
  },
  chartData: [
    { name: "Feb", visits: 38000000 },
    { name: "Mar", visits: 40000000 },
    { name: "Apr", visits: 37000000 },
    { name: "May", visits: 44000000 },
    { name: "June", visits: 41000000 },
    { name: "Jul", visits: 45000000 },
  ],
  recentActivities: [
    { id: 1, date: "13 Feb 2022 23:12 AM", applicant: "Maire Canabis John", status: "Suspended", handler: "AMD Office" },
    { id: 2, date: "13 Feb 2022 23:12 AM", applicant: "Dani Oluomo", status: "Ongoing", handler: "REG Office" },
    { id: 3, date: "13 Feb 2022 23:12 AM", applicant: "Sare Kaba-kaba Oti", status: "Completed", handler: "AMD Office" },
    { id: 4, date: "13 Feb 2022 23:12 AM", applicant: "Oluchi Chinelo", status: "Ongoing", handler: "Reg Office" },
  ]
};
