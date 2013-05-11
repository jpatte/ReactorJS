
class MathUtils
{
    /**  Returns a random number in the inverval [0, 1[ */
    static random(): number
    {
        return Math.random();
    }

    /**  Returns a random number in the inverval [-1, 1[ */
    static random2(): number
    {
        return Math.random() * 2 - 1;
    }
}