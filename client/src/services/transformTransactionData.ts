interface Transaction {
  type: string;
  amount: number;
  date: string;
}

interface DailyData {
  date: string;
  debited: number;
  credited: number;
}



function transformTransactionData(transactions: Transaction[]): DailyData[] {
  const dailyData: Record<string, DailyData> = {};

  transactions.forEach((transaction) => {
    let date = transaction.date?.split("T")[0]; 
    let amount = transaction.amount ?? 0;
    let type = transaction.type?.toLowerCase(); 

    if (!date) return; 

    if (!dailyData[date]) {
      dailyData[date] = { date, debited: 0, credited: 0 };
    }

    if (type === "debited") {
      dailyData[date].debited += Number(amount);
    } else if (type === "credited") {
      dailyData[date].credited += Number(amount);
    }
  });

  let sortedData = Object.values(dailyData).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  while (sortedData.length > 0 && sortedData[0].debited === 0 && sortedData[0].credited === 0) {
    sortedData.shift();
  }

  return sortedData;
}

export default transformTransactionData;
