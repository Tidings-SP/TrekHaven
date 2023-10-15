import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"
import { themes } from "./themes"
import { useConfig } from "./use-config"
import { useEffect, useState } from "react"
import { and, collection, onSnapshot, query, where } from "firebase/firestore"
import { auth, db } from "@/app/authentication/firebase"
import { onAuthStateChanged } from "firebase/auth"



// const data = [
//   {
    
//     today: 240,
//   },
//   {
    
//     today: 139,
//   },
//   {
    
//     today: 980,
//   },
//   {
    
//     today: 390,
//   },
//   {
    
//     today: 480,
//   },
//   {
    
//     today: 380,
//   },
//   {
    
//     today: 430,
//   },
  
// ]

export default function ReportMetrics() {
  const { theme: mode } = useTheme()
  const [config] = useConfig()
  const [data, setData] = useState<{total:number, time:string}[]>([]);
  let uid = auth.currentUser?.uid;
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is authenticated, update uid
      uid = user.uid;
    }
  });

  const fetch = (uid:any) => {
    
    if(uid){

      const q = query(collection(db, "history"), 
      and(
        where("createrid", "==", uid),
        where("status", "==","success")
      ));
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setData(
          querySnapshot.docs.map((doc) => ({total: doc.data().price, time: doc.data().time }))
        );
      });

      
  
      return () => unsubscribe(); // Cleanup when the component unmounts
    }
  }
  useEffect(() => {
    fetch(uid)

  },[uid])

  useEffect(() => {
    data.sort((a, b) => {
      const dateA = new Date(a.time).getTime();
      const dateB = new Date(b.time).getTime();
    
      return dateA - dateB; // Sorting in ascending order
    });

    // Calculate cumulative score
    let cumulativeScore = 0;
    data.forEach((item) => {
      cumulativeScore += Number(item.total);
      item.total = cumulativeScore;
    });
    console.log(data)

    
  },[data])

  const theme = themes.find((theme:any) => theme.name === config.theme)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Chart</CardTitle>
        <CardDescription>
          Cumulative revenue is drawn here!!...
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            {/* <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Average
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].value}
                            </span> */}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Total
                            </span>
                            <span className="font-bold">
                              {payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return null
                }}
              />
              {/* <Line
                type="monotone"
                strokeWidth={2}
                dataKey="average"
                activeDot={{
                  r: 6,
                  style: { fill: "var(--theme-primary)", opacity: 0.25 },
                }}
                style={
                  {
                    stroke: "var(--theme-primary)",
                    opacity: 0.25,
                    "--theme-primary": `hsl(${
                      theme?.cssVars[mode === "dark" ? "dark" : "light"].primary
                    })`,
                  } as React.CSSProperties
                }
              /> */}
              <Line
                type="monotone"
                dataKey="total"
                strokeWidth={2}
                activeDot={{
                  r: 8,
                  style: { fill: "var(--theme-primary)" },
                }}
                style={
                  {
                    stroke: "var(--theme-primary)",
                    "--theme-primary": `hsl(${
                      theme?.cssVars[mode === "dark" ? "dark" : "light"].primary
                    })`,
                  } as React.CSSProperties
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}