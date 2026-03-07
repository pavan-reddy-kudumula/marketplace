import {prisma} from "@/lib/prisma";
import ProductPage from "@/components/ProductPage";
import Navbar from "@/components/Navbar";
import { auth } from "@/auth";

interface HomeProps {
  searchParams: {
    category? : string;
    search? : string;
  }
}

export default async function Home({searchParams}: HomeProps) {
  const {category, search} = await searchParams;
  const products = await prisma.product.findMany({
    where: {
      category: {
        equals: category,
        mode: "insensitive"
      },
      name: {
        contains: search,
        mode: "insensitive"
      },
    },
    include: {
      store: true
    }
  })
  const session = await auth();
  
  return (
    <>
      <Navbar session={session}/>
      <ProductPage products={products}/>
    </>
  )
}