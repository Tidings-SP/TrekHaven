import Link from "next/link"

export default function Filters() {
  return(
    <div className="hidden border-b lg:block ">
    <div className="container">
      <div className="flex w-fit gap-10 mx-auto font-medium py-4">
        
        <Link className="navbar__link relative" href="#">
          Amenities
        </Link>
        <Link className="navbar__link relative" href="#">
          Price
        </Link>
        <Link className="navbar__link relative" href="#">
          Location
        </Link>
        
      </div>
    </div>
  </div>
  )
}