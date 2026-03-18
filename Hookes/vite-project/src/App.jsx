import { useState } from "react";

function App(){
 let [count , setCount]= useState(0);


   function increaseNumber(){
  count++;
  setCount(count);
   }


  return(
    <>
    <p> Counter: {count}</p>
    <button onClick={increaseNumber}> Increment: {count}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       

      
    </button>

    </>
  )


}

export default App;