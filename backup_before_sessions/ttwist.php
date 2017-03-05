<?php
    //Imports the sqlite database
    $dbhandle = new PDO("sqlite:scrabble.sqlite") or die("Failed to open DB");
    if (!$dbhandle) die ($error);
    
    //this lets the browser know to expect json
    header('Content-Type: application/json');
    //$query = "SELECT * FROM racks limit 1";
    
    $word_list = [];
    
    function call_query($query){
        global $dbhandle;
        $statement = $dbhandle->prepare($query);
        $statement->execute();
        //Results is json
        $results = $statement->fetchAll();
        return $results;
    }
    
    function subset_words($myrack){
        $racks = [];
        for($i = 0; $i < pow(2, strlen($myrack)); $i++){
        	$ans = "";
        	for($j = 0; $j < strlen($myrack); $j++){
        		//if the jth digit of i is 1 then include letter
        		if (($i >> $j) % 2) {
        		  $ans .= $myrack[$j];
        		}
        	}
        	if (strlen($ans) > 1){
          	    $racks[] = $ans;	
        	}
        }
        $racks = array_unique($racks);
        return $racks;
    }
    
    function get_six_letter_word(){
        $query = "SELECT rack, words FROM racks WHERE length=6 ORDER BY random() limit 1";
        $json_results = call_query($query);
        return $json_results;
        
    }
    
    
    $json_res = get_six_letter_word();
    $six_letter_words = $json_res[0]["words"];
    $six_letter_rack = $json_res[0]["rack"];
    $subset_racks = subset_words($six_letter_rack);
    //parse($six_letter_words);

    foreach($subset_racks as $rack){
        get_words_from_subset($rack);
    }
    function get_words_from_subset($rack)
    {
        $query = "SELECT words FROM racks where rack=\"" . $rack ."\""; 
        $json_results = call_query($query);
        parse($json_results[0]["words"]);
        return $json_results;
    }
    
    function parse($words)
    {
        global $word_list;
         $word_arr = explode("@@",$words);
         foreach($word_arr as $word){
             if($word)
             {
                array_push($word_list, $word);
             } 
         }
    }

    echo json_encode($word_list);
    
    
?>