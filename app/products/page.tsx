import { getProducts } from "@/actions/product";
import ProductPage from "@/components/ProductPage";

interface HomeProps {
  searchParams: {
    category? : string;
    search? : string;
  }
}

export default async function Home({searchParams}: HomeProps) {
  const {category, search} = await searchParams;
  const products = await getProducts({category, search});
  
  return (
    <ProductPage products={products.data}/>
  )
}