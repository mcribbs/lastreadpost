<?php
// LastReadPostServer
// version 0.2
// 2006-04-04
// Copyright (c) 2006, Matt Cribbs
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html

//
// USER MODIFIABLE STUFF
//
$server = 'localhost';  //this should almost always be localhost
$database = 'lastreadpost';
$user = '';
$password = '';
//
// END USER MODIFIABLE STUFF
//

$link = mysql_connect($server,$user,$password);
if (!$link) die('Could not connect to database: ' . mysql_error());
$db = mysql_select_db($database, $link);
if (!$db) die('Could not connect to database: ' . mysql_error());

switch ($_GET['action'])
{
    case 'setHistory':
        $value = mysql_real_escape_string($_GET['value']);
        $keys = split("\^\^", $value);
        $newkeys = array();
        for ($i = 0; $i < count($keys); $i++)
        {
            $query = "SELECT * FROM `postvalues` WHERE `key` = '" . $keys[$i] . "'";
            if (mysql_num_rows(mysql_query($query)) > 0)
            {
                array_push($newkeys, $keys[$i]);
            }
        }
        if (count($newkeys) > 15)
            array_splice($newkeys, 15);
        $newvalue = implode("^^", $newkeys);
        $result = mysql_query("UPDATE `history` SET `history` = '$newvalue'");
        if (!$result) die('Could not set history: ' . mysql_error());
        break;
        
    case 'getHistory':
        $result = mysql_query("SELECT `history` FROM `history`");
        if (!$result) die('Could not get history: ' . mysql_error());
        while ($row = mysql_fetch_assoc($result)) {
            echo $row['history'];
        }
        break;
        
    case 'set':
        $key = mysql_real_escape_string($_GET['key']);
        if (mysql_num_rows(mysql_query("SELECT * FROM `postvalues` WHERE `key` = '$key'")) < 1)
        {
            $result = mysql_query("INSERT INTO `postvalues` (`key`) VALUES ('$key')");
            if (!$result) die('Could create thread: ' . mysql_error());
        }
        $r = mysql_real_escape_string($_GET['r']);
        $result = mysql_query("UPDATE `postvalues` SET `r` = '$r' WHERE `key` = '$key'");
        if (!$result) die('Could not set r: ' . mysql_error());

        $p = mysql_real_escape_string($_GET['p']);
        if ($p)
        {
            $result = mysql_query("UPDATE `postvalues` SET `p` = '$p' WHERE `key` = '$key'");
            if (!$result) die('Could not set p: ' . mysql_error());
        }
    
        $c = mysql_real_escape_string($_GET['c']);
        if ($c)
        {
            $result = mysql_query("UPDATE `postvalues` SET `c` = '$c' WHERE `key` = '$key'");
            if (!$result) die('Could not set c: ' . mysql_error());
        }
    
        $t = mysql_real_escape_string($_GET['t']);
        if ($t)
        {
            $result = mysql_query("UPDATE `postvalues` SET `t` = '$t' WHERE `key` = '$key'");
            if (!$result) die('Could not set t: ' . mysql_error());
        }
        break;
        
    case 'get':
        $key = mysql_real_escape_string($_GET['key']);
        $result = mysql_query("SELECT `key`,`r`,`p`,`c`,`t` FROM `postvalues` where `key` = '$key'");
        if (!$result) die('Could not get thread values: ' . mysql_error());
        while ($row = mysql_fetch_assoc($result)) {
            echo $row['key'];
            echo '|';
            echo $row['r'];
            echo '|';
            echo $row['p'];
            echo '|';
            echo $row['c'];
            echo '|';
            echo stripslashes($row['t']);
        }
        break;
        
    case 'remove':
        $key = mysql_real_escape_string($_GET['key']);
        $result = mysql_query("DELETE FROM `postvalues` WHERE `key` = '$key'");
        if (!$result) die('Could not remove thread values: ' . mysql_error());
        break;
        
    default:
        echo 'Invalid action';
}
