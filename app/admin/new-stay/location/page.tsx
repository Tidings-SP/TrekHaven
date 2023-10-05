import { Separator } from "@/components/ui/separator"
import { LocationForm } from "./location-form"

export default function Location() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Location</h3>
        <p className="text-sm text-muted-foreground">
          This helps the user to know the location of your stay!
        </p>
      </div>
      <Separator />
      <LocationForm />
    </div>
  )
}