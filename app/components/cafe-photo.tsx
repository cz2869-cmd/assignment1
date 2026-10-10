type CafePhotoProps = {
  name: string
  address: string
  image?: string
  hero?: boolean
  peek?: boolean
}

export default function CafePhoto({
  name,
  address,
  image,
  hero = false,
  peek = false,
}: CafePhotoProps) {
  const alt = `${name}, ${address}`

  return (
    <div
      className={`cafePhoto${hero ? ' cafePhotoHero' : ''}${peek ? ' cafePhotoPeek' : ''}`}
    >
      {image ? (
        <img src={image} alt={alt} />
      ) : (
        <span className="cafePhotoLabel">Cafe photo</span>
      )}
    </div>
  )
}
