import WikipediaGraph from "@/components/wikipedia-graph"
import CustomNode from "@/components/custom-node"

export default function Home() {
  const testnode = {
    "title": "Escapism",
    "summary": "Escapism is the tendency to seek distraction and relief from unpleasant realities, especially by engaging in entertainment or fantasy. It has been observed throughout history in various forms, including literature, film, and music, and can serve as a coping mechanism or a means of avoiding personal or societal challenges.",
    "image": "https://i.pinimg.com/736x/eb/9f/94/eb9f9439a382199ed5b8a928a2e39081.jpg",
    "links": [
      {
        "title": "Everyday life",
        "url": "https://en.wikipedia.org/wiki/Everyday_life"
      },
      {
        "title": "Imagination",
        "url": "https://en.wikipedia.org/wiki/Imagination"
      },
      {
        "title": "Entertainment",
        "url": "https://en.wikipedia.org/wiki/Entertainment"
      },
      {
        "title": "Bread and circuses",
        "url": "https://en.wikipedia.org/wiki/Bread_and_circuses"
      }
    ]
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <WikipediaGraph />
    </main>
  )
}

