import React from 'react'

const Home = () => {
  return (
      
    <main>
            
        <div id="hero"
            className="min-h-[calc(100vh-4rem)]  bg-gradient-to-b from-indigo-100 via-blue-10 to-transparent md:text-sm ">
            <div id="hero-container"
                className="max-w-4xl mx-auto h-[85vh] px-5 md:px-11 pb-12 flex flex-col justify-center md:items-center md:text-center  ">
                <div id="version-text"
                    className="flex my-6 gap-2 border-1 border-yellow-100 bg-yellow-200 rounded-lg px-2 py-[1px] w-fit cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-[1px] transition duration-400 ease-in-out group">
                    <span className="text-[16px] font-medium text-yellow-900 flex items-center gap-2">Source Code <p
                            className="group-hover:translate-x-1 text-red transition duration-400 pb-[3px]  text-[16px] ease-in-out ">
                            &#8594;</p>
                    </span>
                </div>
                <div id="hero-features" className="flex gap-5 my-4">
                    <p className="text-zinc-600 text-medium"> React JS &#9989;</p>
                    <p className="text-zinc-600 text-medium"> Express JS &#9989;</p>
                    <p className="text-zinc-600 text-medium"> MongoDB &#9989;</p>
                </div>
                <h1 className=" text-3xl md:text-6xl font-bold text-gray-900 mb-6 md:leading-[4.9rem]">Play and compete with
                    friends in real-time quizzes! </h1>
                <p className="text-[17px] max-w-150 ">Bring your expertise and knowledge to the test. Have a fun time!</p>
                <div id="button-container" className="mt-12 flex flex-col md:flex-row gap-4">
                    <button
                        className="bg-gradient-to-r from-blue-600 to-blue-500  md:text-[17px] h-12  text-white px-7 py-2 rounded hover:to-blue-600 transition duration-300 font-semibold shadow-sm  cursor-pointer flex gap-2 justify-evenly items-center group">Get
                        Started

                        <img height="28" width="20"
                            className="hidden md:block group-hover:translate-x-2 transition duration-300 ease-in-out"
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA6UlEQVR4nO3bPW6DUBhEUdaQFWSRliK7sXfqIgsZV1Y6/xTP80WcUyOB5gKiYdsAAAAAAAAAAAB2JMklyal9HXse/06E4vgiDBhfhE9I8pXkN48dPnIxe5XkO8n1SQRPwkoiDCDCACIMIMIAIgwgwgAiDCDCACIMIMIAIgwgwgAiDCDCf43w5GDW+Iuw6AS8GuGFA1nnJEDXUYCeo1dQe3wqn6HGX8H4RcYvMn6R8YuMX2T8IuMXGb/I+EXGLzJ+kfGLjF9k/CLjF/lNdYAkP+78mRGMX4xg/IYkZ+98AAAAAAAAAABge9MNdUiK3dKPawUAAAAASUVORK5CYII="
                            alt="long-arrow-right" /> </button>
                    <button
                        className="bg-gray-10  md:text-[17px] h-12  border-2  border-gray-400 text-gray-700 px-7 py-2 rounded hover:border-blue-600 hover:text-blue-900 transition duration-100 font-semibold cursor-pointer">Learn
                        More</button>
                </div>
            </div>
        </div>

        <div id="company">
            <div id="company-title" className="flex justify-center">
                <span className="text-3xl font-medium text-blue-800">| Features |</span>
            </div>

            <div id="lines" className="mt-12">
                <div id="line1" className="wrapper  mx-auto px-6 md:px-11  flex justify-center  gap-3 items-center h-24 rounded-xl">
                       
                         
                </div>
            </div>
        </div>


        <div className="h-screen"></div>
    </main>
  )
}

export default Home